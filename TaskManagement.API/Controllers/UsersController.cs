using Microsoft.AspNetCore.Mvc;
using TaskManagement.API.Models;

namespace TaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private static readonly List<User> Users =
    [
        new("1", "Alice Johnson",  "AJ", "cyan"),
        new("2", "Bob Smith",      "BS", "emerald"),
        new("3", "Carol Davis",    "CD", "amber"),
        new("4", "David Lee",      "DL", "rose"),
        new("5", "Emma Wilson",    "EW", "sky"),
    ];

    [HttpGet]
    public IActionResult GetUsers() => Ok(Users);
}
