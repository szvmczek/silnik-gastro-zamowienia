package com.pizzashowcase.identity.application;

import com.pizzashowcase.identity.api.dto.LoginRequest;
import com.pizzashowcase.identity.api.dto.LoginResponse;
import com.pizzashowcase.identity.api.dto.UserSummaryDto;
import com.pizzashowcase.identity.domain.User;
import com.pizzashowcase.identity.infrastructure.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private String dummyHash;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostConstruct
    void initDummyHash() {
        this.dummyHash = passwordEncoder.encode("timing-equalizer");
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email()).orElse(null);
        if (user == null) {
            passwordEncoder.matches(request.password(), dummyHash);
            throw new BadCredentialsException("Invalid credentials");
        }
        if (!user.isActive()) {
            throw new DisabledException("Account is disabled");
        }
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }
        JwtService.IssuedToken issued = jwtService.issue(user);
        return new LoginResponse(
                issued.token(),
                issued.expiresAt(),
                new UserSummaryDto(user.getEmail(), user.getDisplayName(), user.getRole().name())
        );
    }
}
