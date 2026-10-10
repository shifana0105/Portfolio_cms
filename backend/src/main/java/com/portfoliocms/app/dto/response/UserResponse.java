package com.portfoliocms.app.dto.response;

import com.portfoliocms.app.entity.User;

/**
 * Public-facing shape of a User. Deliberately excludes passwordHash - the
 * entity is never serialized directly, per the DTO rule in the approved
 * architecture.
 */
public record UserResponse(Long id, String email, String fullName) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getFullName());
    }
}
