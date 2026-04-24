package com.smartcampus.resource.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.smartcampus.resource.entity.CampusResource;

public interface CampusResourceRepository extends MongoRepository<CampusResource, String> {

    boolean existsByNameIgnoreCaseAndLocationIgnoreCase(String name, String location);

    boolean existsByNameIgnoreCaseAndLocationIgnoreCaseAndIdNot(String name, String location, String id);
}
