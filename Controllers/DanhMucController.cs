using Microsoft.AspNetCore.Mvc;
using SellerHub.Api.Data;
using SellerHub.Api.Models.Requests;

namespace SellerHub.Api.Controllers;

[ApiController]
[Route("api/danh-muc")]
public sealed class DanhMucController : ControllerBase
{
    private readonly DanhMucRepository _repo;

    public DanhMucController(DanhMucRepository repo)
    {
        _repo = repo;
    }

    // GET /api/danh-muc?tuKhoa=...
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? tuKhoa)
    {
        var data = await _repo.GetAllAsync(tuKhoa);
        return Ok(data);
    }

    // POST /api/danh-muc
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDanhMucRequest req)
    {
        try
        {
            var id = await _repo.CreateAsync(req);
            return CreatedAtAction(nameof(GetAll), new { id }, new { maDanhMuc = id });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // PUT /api/danh-muc/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateDanhMucRequest req)
    {
        try
        {
            await _repo.UpdateAsync(id, req);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
        catch (Exception ex) { return BadRequest(ex.Message); }
    }

    // DELETE /api/danh-muc/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        try
        {
            await _repo.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
        catch (Exception ex) { return BadRequest(ex.Message); }
    }
}
