package backend.dto;

public class ResourceStatsResponse {

    private long totalCount;
    private long availableCount;
    private long bookedCount;
    private long outOfServiceCount;

    public ResourceStatsResponse(long totalCount, long availableCount, long bookedCount, long outOfServiceCount) {
        this.totalCount = totalCount;
        this.availableCount = availableCount;
        this.bookedCount = bookedCount;
        this.outOfServiceCount = outOfServiceCount;
    }

    public long getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(long totalCount) {
        this.totalCount = totalCount;
    }

    public long getAvailableCount() {
        return availableCount;
    }

    public void setAvailableCount(long availableCount) {
        this.availableCount = availableCount;
    }

    public long getBookedCount() {
        return bookedCount;
    }

    public void setBookedCount(long bookedCount) {
        this.bookedCount = bookedCount;
    }

    public long getOutOfServiceCount() {
        return outOfServiceCount;
    }

    public void setOutOfServiceCount(long outOfServiceCount) {
        this.outOfServiceCount = outOfServiceCount;
    }
}
