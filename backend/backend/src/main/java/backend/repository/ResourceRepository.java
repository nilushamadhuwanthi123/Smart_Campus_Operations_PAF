
package backend.repository;

import backend.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ResourceRepository extends MongoRepository<Resource, String> {

    // ✅ check duplicate name
    boolean existsByNameIgnoreCase(String name);

    // ✅ check duplicate resource code
    boolean existsByResourceCodeIgnoreCase(String resourceCode);

    // ✅ stats
    long countByStatusIgnoreCase(String status);
}