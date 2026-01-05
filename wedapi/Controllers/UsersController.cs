using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SellerHub.Api.Data;
using SellerHub.Api.model;
using System.ComponentModel.DataAnnotations.Schema;
using SellerHub.Api.Dto;

namespace SellerHub.Api.Controllers;

[ApiController]
[Route("api/admin/users")]
public class UsersController : ControllerBase
{
    private readonly SellerHubDbContext _db;

    public UsersController(SellerHubDbContext db)
    {
        _db = db;
    }

    // GET: api/admin/users
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var data = await _db.Users
            .OrderByDescending(x => x.Id)
            .ToListAsync();

        return Ok(data);
    }

    // GET: api/admin/users/5
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();
        return Ok(user);
    }

    // POST: api/admin/users
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] User input)
    {
        _db.Users.Add(input);
        await _db.SaveChangesAsync();
        return Ok(input);
    }

    // PUT: api/admin/users/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUserDto input)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();

        user.FullName = input.FullName;
        user.Email = input.Email;
        user.Phone = input.Phone;
        user.Role = input.Role;
        user.Status = input.Status;

        var newPw = input.GetPassword();
        if (!string.IsNullOrWhiteSpace(newPw))
        {
            user.PasswordHash = newPw; // demo 
        }

        await _db.SaveChangesAsync();
        return Ok(user);
    }


    // PATCH: api/admin/users/5/lock
    [HttpPatch("{id:int}/lock")]
    public async Task<IActionResult> Lock(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();

        user.Status = "Locked";
        await _db.SaveChangesAsync();
        return Ok(user);
    }

    // PATCH: api/admin/users/5/unlock
    [HttpPatch("{id:int}/unlock")]
    public async Task<IActionResult> Unlock(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();

        user.Status = "Active";
        await _db.SaveChangesAsync();
        return Ok(user);
    }

    // DELETE: api/admin/users/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return Ok();
    }
}