package com.portfoliocms.app.security;

import com.portfoliocms.app.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Spring Security's UserDetails, wrapping our User entity so controllers
 * and services in later phases can pull the authenticated user's id
 * straight off the SecurityContext (via @AuthenticationPrincipal) instead
 * of trusting any id/username supplied in a request - this is the
 * mechanism the "derive userId from the JWT, never from a path/body param"
 * ownership rule depends on.
 */
public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String email;
    private final String passwordHash;

    public UserPrincipal(Long id, String email, String passwordHash) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
    }

    public static UserPrincipal from(User user) {
        return new UserPrincipal(user.getId(), user.getEmail(), user.getPasswordHash());
    }

    public Long getId() {
        return id;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // No role/permission system in Phase 1 - every authenticated user
        // has the same baseline access. Roles can be layered on later
        // without changing this shape.
        return List.of();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
