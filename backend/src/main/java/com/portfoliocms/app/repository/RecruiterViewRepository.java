package com.portfoliocms.app.repository;

import com.portfoliocms.app.entity.RecruiterView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RecruiterViewRepository extends JpaRepository<RecruiterView, Long> {

    Optional<RecruiterView> findByUserIdAndIpHashAndViewDate(Long userId, String ipHash, LocalDate viewDate);

    long countByUserId(Long userId);

    @Query("SELECT COUNT(rv) FROM RecruiterView rv WHERE rv.user.id = :userId AND rv.viewDate >= :since")
    long countByUserIdAndViewDateAfter(@Param("userId") Long userId, @Param("since") LocalDate since);

    @Query("SELECT rv.viewDate, COUNT(rv) FROM RecruiterView rv WHERE rv.user.id = :userId AND rv.viewDate >= :since GROUP BY rv.viewDate ORDER BY rv.viewDate ASC")
    List<Object[]> countByUserIdGroupedByDate(@Param("userId") Long userId, @Param("since") LocalDate since);
}
