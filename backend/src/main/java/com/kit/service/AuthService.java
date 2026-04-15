package com.kit.service;

import com.kit.dto.AuthDto;
import com.kit.entity.User;
import com.kit.repository.UserRepository;
import com.kit.security.JwtService;
import com.kit.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getRole())
                .build();

        userRepository.save(user);

        var userDetails = new UserDetailsImpl(user);
        var jwtToken = jwtService.generateToken(userDetails);

        return AuthDto.AuthResponse.builder()
                .token(jwtToken)
                .user(mapToUserDto(user))
                .build();
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();
        var userDetails = new UserDetailsImpl(user);
        var jwtToken = jwtService.generateToken(userDetails);

        return AuthDto.AuthResponse.builder()
                .token(jwtToken)
                .user(mapToUserDto(user))
                .build();
    }

    private AuthDto.UserDto mapToUserDto(User user) {
        return AuthDto.UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .fullName(user.getFullName())
                .profilePicture(user.getProfilePicture())
                .bio(user.getBio())
                .build();
    }
}
