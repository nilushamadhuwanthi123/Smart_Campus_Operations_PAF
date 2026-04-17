package backend.service;

import backend.dto.ResourceStatsResponse;
import backend.model.Resource;
import backend.repository.ResourceRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public Resource createResource(Resource resource) {
        resource.setId(null);
        return resourceRepository.save(resource);
    }

    public Resource updateResource(Long id, Resource updatedResource) {
        Resource existingResource = getResourceById(id);
        existingResource.setResourceCode(updatedResource.getResourceCode());
        existingResource.setName(updatedResource.getName());
        existingResource.setType(updatedResource.getType());
        existingResource.setCapacity(updatedResource.getCapacity());
        existingResource.setLocation(updatedResource.getLocation());
        existingResource.setStatus(updatedResource.getStatus());
        return resourceRepository.save(existingResource);
    }

    public void deleteResource(Long id) {
        Resource existingResource = getResourceById(id);
        resourceRepository.delete(existingResource);
    }

    public ResourceStatsResponse getResourceStats() {
        long totalCount = resourceRepository.count();
        long availableCount = resourceRepository.countByStatusIgnoreCase("Available");
        long bookedCount = resourceRepository.countByStatusIgnoreCase("Booked");
        long outOfServiceCount = resourceRepository.countByStatusIgnoreCase("Out of Service");

        return new ResourceStatsResponse(totalCount, availableCount, bookedCount, outOfServiceCount);
    }

    private Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Resource not found with id: " + id));
    }
}
