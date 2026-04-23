package backend.controller;

import backend.dto.ResourceStatsResponse;
import backend.model.Resource;
import backend.service.ResourceService;
import jakarta.validation.Valid;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    // ✅ GET ALL
    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    // ✅ CREATE
    @PostMapping
    public ResponseEntity<Resource> createResource(@Valid @RequestBody Resource resource) {
        Resource saved = resourceService.createResource(resource);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ✅ UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(@PathVariable String id,
                                                   @Valid @RequestBody Resource resource) {
        resource.setId(id);
        Resource updated = resourceService.updateResource(id, resource);
        return ResponseEntity.ok(updated);
    }

    // ✅ DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ STATS
    @GetMapping("/stats")
    public ResponseEntity<ResourceStatsResponse> getResourceStats() {
        return ResponseEntity.ok(resourceService.getResourceStats());
    }
}