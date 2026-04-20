namespace TaskManagement.API.Models;

public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsCompleted { get; set; } = false;
    public string Priority { get; set; } = "Medium"; // Low, Medium, High
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DueDate { get; set; }
    public string? AssignedTo { get; set; }
    public string? Tags { get; set; }  // stored as comma-separated
}
