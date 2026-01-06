using Microsoft.AspNetCore.Mvc;
using wedduyhuy.DTOs;
using wedduyhuy.Repositories;

namespace wedduyhuy.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class KhachHangController : ControllerBase
    {
        private readonly IKhachHangRepository _repo;

        public KhachHangController(IKhachHangRepository repo) => _repo = repo;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<KhachHangDto>>> GetAll()
        {
            return Ok(await _repo.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<KhachHangDto>> GetById(int id)
        {
            var item = await _repo.GetByIdAsync(id);
            return item == null ? NotFound() : Ok(item);
        }

        [HttpGet("phone/{phone}")]
        public async Task<ActionResult<KhachHangDto>> GetByPhone(string phone)
        {
            var item = await _repo.GetByPhoneAsync(phone);
            return item == null ? NotFound() : Ok(item);
        }

        [HttpGet("loai/{loai}")]
        public async Task<ActionResult<IEnumerable<KhachHangDto>>> GetByLoai(string loai)
        {
            return Ok(await _repo.GetByLoaiAsync(loai));
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<KhachHangDto>>> Search([FromQuery] string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword)) return BadRequest("Keyword required");
            return Ok(await _repo.SearchAsync(keyword));
        }

        [HttpPost]
        public async Task<ActionResult<KhachHangDto>> Create([FromBody] CreateKhachHangDto dto)
        {
            var id = await _repo.CreateAsync(dto);
            var created = await _repo.GetByIdAsync(id);
            return CreatedAtAction(nameof(GetById), new { id }, created);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] UpdateKhachHangDto dto)
        {
            if (await _repo.GetByIdAsync(id) == null) return NotFound();
            await _repo.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            if (await _repo.GetByIdAsync(id) == null) return NotFound();
            await _repo.DeleteAsync(id);
            return NoContent();
        }
    }
}
