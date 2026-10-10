package com.portfoliocms.app.service;

import com.portfoliocms.app.dto.response.ResumeResponse;
import com.portfoliocms.app.entity.Resume;
import com.portfoliocms.app.entity.User;
import com.portfoliocms.app.exception.NotFoundException;
import com.portfoliocms.app.repository.ResumeRepository;
import com.portfoliocms.app.repository.UserRepository;
import com.portfoliocms.app.util.FileUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    @Value("${app.storage.upload-dir}")
    private String uploadDir;

    public ResumeResponse getByUserId(Long userId) {
        Resume resume = resumeRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("No resume found"));
        return ResumeResponse.from(resume);
    }

    public boolean existsForUser(Long userId) {
        return resumeRepository.existsByUserId(userId);
    }

    @Transactional
    public ResumeResponse upload(Long userId, MultipartFile file) throws IOException {
        // Validate size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds 5 MB limit");
        }

        // Validate content type (server-side, don't trust browser MIME alone)
        byte[] bytes = file.getBytes();
        if (!FileUtil.isPdfContent(bytes)) {
            throw new IllegalArgumentException("Only PDF files are allowed. The uploaded file is not a valid PDF.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        // Safe filename
        String originalFilename = FileUtil.sanitizeFilename(file.getOriginalFilename());
        String storedFilename = UUID.randomUUID().toString() + ".pdf";

        // Ensure upload directory exists
        Path uploadPath = Paths.get(uploadDir, "resumes").toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        // Store file
        Path targetPath = uploadPath.resolve(storedFilename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // Delete old resume file if replacing
        Resume existing = resumeRepository.findByUserId(userId).orElse(null);
        if (existing != null) {
            deleteFile(existing.getStoredFilename());
            existing.setOriginalFilename(originalFilename);
            existing.setStoredFilename(storedFilename);
            existing.setContentType("application/pdf");
            existing.setFileSize(file.getSize());
            return ResumeResponse.from(resumeRepository.save(existing));
        }

        Resume resume = new Resume();
        resume.setUser(user);
        resume.setOriginalFilename(originalFilename);
        resume.setStoredFilename(storedFilename);
        resume.setContentType("application/pdf");
        resume.setFileSize(file.getSize());

        return ResumeResponse.from(resumeRepository.save(resume));
    }

    @Transactional
    public void delete(Long userId) {
        Resume resume = resumeRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("No resume found"));
        deleteFile(resume.getStoredFilename());
        resumeRepository.delete(resume);
    }

    public Resource loadResumeFile(Long userId) {
        Resume resume = resumeRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("No resume found"));

        try {
            Path filePath = Paths.get(uploadDir, "resumes", resume.getStoredFilename())
                    .toAbsolutePath().normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) {
                throw new NotFoundException("Resume file not found on server");
            }
            return resource;
        } catch (IOException e) {
            throw new NotFoundException("Resume file not found on server");
        }
    }

    public String getOriginalFilename(Long userId) {
        Resume resume = resumeRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("No resume found"));
        return resume.getOriginalFilename();
    }

    private void deleteFile(String storedFilename) {
        try {
            Path filePath = Paths.get(uploadDir, "resumes", storedFilename)
                    .toAbsolutePath().normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {
            // Best effort
        }
    }
}
