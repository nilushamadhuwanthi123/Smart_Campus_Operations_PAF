package com.smartcampus.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;

/**
 * Verifies MongoDB connectivity at startup and logs a clear status message.
 */
@Configuration
public class MongoConnectionLogger {

    private static final Logger LOGGER = LoggerFactory.getLogger(MongoConnectionLogger.class);

    @Bean
    CommandLineRunner logMongoConnectionStatus(MongoTemplate mongoTemplate) {
        return args -> {
            try {
                mongoTemplate.executeCommand("{ ping: 1 }");
                LOGGER.info("Database connected: MongoDB is available");
            } catch (Exception exception) {
                LOGGER.warn(
                        "Database ping failed at startup. Application will continue and retry on demand. Root cause: {}",
                        exception.getMessage());
            }
        };
    }
}
