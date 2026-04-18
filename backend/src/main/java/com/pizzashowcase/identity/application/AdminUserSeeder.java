package com.pizzashowcase.identity.application;

import com.pizzashowcase.identity.domain.Role;
import com.pizzashowcase.identity.domain.User;
import com.pizzashowcase.identity.infrastructure.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AdminUserSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminUserSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;
    private final String adminDisplayName;

    public AdminUserSeeder(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           @Value("${app.admin.email:admin@pizza-demo.local}") String adminEmail,
                           @Value("${app.admin.password:}") String adminPassword,
                           @Value("${app.admin.display-name:Admin}") String adminDisplayName) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.adminDisplayName = adminDisplayName;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.existsByEmailIgnoreCase(adminEmail)) {
            log.info("Admin user already exists ({}), skipping seed", adminEmail);
            return;
        }
        if (adminPassword == null || adminPassword.isBlank()) {
            log.warn("ADMIN_PASSWORD not set — skipping admin seed. Set it in .env and restart.");
            return;
        }
        User admin = new User(adminEmail, passwordEncoder.encode(adminPassword), adminDisplayName, Role.ADMIN);
        userRepository.save(admin);
        log.info("Seeded admin user {}", adminEmail);
    }
}
