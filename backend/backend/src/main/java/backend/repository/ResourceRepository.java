package backend.repository;

import backend.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    long countByStatusIgnoreCase(String status);
}
