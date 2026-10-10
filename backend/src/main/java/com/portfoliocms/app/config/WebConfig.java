package com.portfoliocms.app.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Serves uploaded files (avatars, etc.) as static resources.
 * The URL path /uploads/** maps to the filesystem upload directory.
 * No filesystem paths are ever exposed to the client.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.storage.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path avatarPath = Paths.get(uploadDir, "avatars").toAbsolutePath().normalize();
        registry.addResourceHandler("/uploads/avatars/**")
                .addResourceLocations("file:" + avatarPath.toString() + "/");
    }
}
