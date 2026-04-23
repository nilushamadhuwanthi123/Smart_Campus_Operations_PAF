package backend.service;

import backend.dto.ResourceStatsResponse;
import backend.model.Resource;
import backend.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    // ✅ GET ALL
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    // ✅ CREATE
    public Resource createResource(Resource resource) {

        validateRequiredFields(resource);
        validateDuplicateName(resource.getName());
        validateDuplicateCode(resource.getResourceCode(), null);

        resource.setId(null);

        return resourceRepository.save(resource);
    }

    // ✅ UPDATE
    public Resource updateResource(String id, Resource updatedResource) {

        Resource existingResource = getResourceById(id);

        validateRequiredFields(updatedResource);

        if (!existingResource.getName().equalsIgnoreCase(updatedResource.getName())) {
            validateDuplicateName(updatedResource.getName());
        }

        validateDuplicateCode(updatedResource.getResourceCode(), id);

        existingResource.setResourceCode(updatedResource.getResourceCode());
        existingResource.setName(updatedResource.getName());
        existingResource.setType(updatedResource.getType());
        existingResource.setCapacity(updatedResource.getCapacity());
        existingResource.setLocation(updatedResource.getLocation());
        existingResource.setStatus(updatedResource.getStatus());
        existingResource.setAvailabilityWindow(updatedResource.getAvailabilityWindow());

        return resourceRepository.save(existingResource);
    }

    // ✅ DELETE
    public void deleteResource(String id) {
        resourceRepository.deleteById(id);
    }

    // ✅ STATS
    public ResourceStatsResponse getResourceStats() {

        long totalCount = resourceRepository.count();
        long availableCount = resourceRepository.countByStatusIgnoreCase("Available");
        long bookedCount = resourceRepository.countByStatusIgnoreCase("Booked");
        long outOfServiceCount = resourceRepository.countByStatusIgnoreCase("Out of Service");

        return new ResourceStatsResponse(
                totalCount,
                availableCount,
                bookedCount,
                outOfServiceCount
        );
    }

    // ================= PRIVATE METHODS =================

    private Resource getResourceById(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
    }

    private void validateDuplicateName(String name) {
        if (resourceRepository.existsByNameIgnoreCase(name)) {
            throw new RuntimeException("Resource already exists with name: " + name);
        }
    }

    private void validateDuplicateCode(String resourceCode, String currentId) {

        if (resourceCode == null || resourceCode.isBlank()) {
            throw new RuntimeException("Resource code is required");
        }

        boolean codeExists = resourceRepository.existsByResourceCodeIgnoreCase(resourceCode);

        if (!codeExists) return;

        if (currentId != null) {
            Resource existing = getResourceById(currentId);
            if (resourceCode.equalsIgnoreCase(existing.getResourceCode())) {
                return;
            }
        }

        throw new RuntimeException("Resource already exists with code: " + resourceCode);
    }

    private void validateRequiredFields(Resource resource) {

        if (resource.getName() == null || resource.getName().isBlank()) {
            throw new RuntimeException("Name is required");
        }

        if (resource.getResourceCode() == null || resource.getResourceCode().isBlank()) {
            throw new RuntimeException("Resource code is required");
        }

        if (resource.getType() == null || resource.getType().isBlank()) {
            throw new RuntimeException("Type is required");
        }

        if (resource.getLocation() == null || resource.getLocation().isBlank()) {
            throw new RuntimeException("Location is required");
        }

        if (resource.getStatus() == null || resource.getStatus().isBlank()) {
            throw new RuntimeException("Status is required");
        }

        if (resource.getAvailabilityWindow() == null || resource.getAvailabilityWindow().isBlank()) {
            throw new RuntimeException("Availability window is required");
        }

        if (resource.getCapacity() <= 0) {
            throw new RuntimeException("Capacity must be greater than 0");
        }
    }
}
