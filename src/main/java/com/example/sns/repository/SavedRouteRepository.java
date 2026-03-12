package com.example.sns.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.sns.domain.SavedRoute;
import com.example.sns.domain.User;

public interface SavedRouteRepository extends JpaRepository<SavedRoute, Long> {

    List<SavedRoute> findByUserOrderByCreatedAtDesc(User user);
}
