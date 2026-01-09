using Microsoft.AspNetCore.Mvc;
using SellerHub.Api.Data;
using SellerHub.Api.Models.Requests;

namespace SellerHub.Api.Controllers;

[ApiController]
[Route("api/san-pham")]
public sealed class SanPhamController : ControllerBase
{
    private readonly SanPhamRepository _repo;

    public SanPhamController(SanPhamRepository repo)
    {
        _repo = repo;
    }

    // GET /api/san-pham?tuKhoa=...&maDanhMuc=1&trangThai=true/false
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? tuKhoa, [FromQuery] int? maDanhMuc, [FromQuery] bool? trangThai)
    {
        var data = await _repo.GetAllAsync(tuKhoa, maDanhMuc, trangThai);
        return Ok(data);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSanPhamRequest req)
    {
        try
        {
            var id = await _repo.CreateAsync(req);
            return CreatedAtAction(nameof(GetAll), new { id }, new { maSanPham = id });
        }
        catch (Exception ex) { return BadRequest(ex.Message); }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateSanPhamRequest req)
    {
        try
        {
            await _repo.UpdateAsync(id, req);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
        catch (Exception ex) { return BadRequest(ex.Message); }
    }

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
