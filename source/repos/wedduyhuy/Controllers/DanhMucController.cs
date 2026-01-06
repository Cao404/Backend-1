using Microsoft.AspNetCore.Mvc;
using wedduyhuy.DTOs;
using wedduyhuy.Repositories;

namespace wedduyhuy.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DanhMucController : ControllerBase
    {
        private readonly IDanhMucRepository _danhMucRepository;

        public DanhMucController(IDanhMucRepository danhMucRepository)
        {
            _danhMucRepository = danhMucRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DanhMucDto>>> GetAll()
        {
            try
            {
                var danhMucs = await _danhMucRepository.GetAllAsync();
                return Ok(danhMucs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DanhMucDto>> GetById(int id)
        {
            try
            {
                var danhMuc = await _danhMucRepository.GetByIdAsync(id);
                if (danhMuc == null)
                    return NotFound(new { message = "Không tìm thấy danh mục" });

                return Ok(danhMuc);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
            }
        }

        [HttpGet("parent/{parentId?}")]
        public async Task<ActionResult<IEnumerable<DanhMucDto>>> GetByParent(int? parentId = null)
        {
            try
            {
                var danhMucs = await _danhMucRepository.GetByParentIdAsync(parentId);
                return Ok(danhMucs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<DanhMucDto>> Create([FromBody] CreateDanhMucDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var id = await _danhMucRepository.CreateAsync(dto);
                var created = await _danhMucRepository.GetByIdAsync(id);
                
                return CreatedAtAction(nameof(GetById), new { id }, created);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] UpdateDanhMucDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var exists = await _danhMucRepository.GetByIdAsync(id);
                if (exists == null)
                    return NotFound(new { message = "Không tìm thấy danh mục" });

                var success = await _danhMucRepository.UpdateAsync(id, dto);
                if (!success)
                    return BadRequest(new { message = "Cập nhật thất bại" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var exists = await _danhMucRepository.GetByIdAsync(id);
                if (exists == null)
                    return NotFound(new { message = "Không tìm thấy danh mục" });

                var success = await _danhMucRepository.DeleteAsync(id);
                if (!success)
                    return BadRequest(new { message = "Xóa thất bại" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
            }
        }
    }
}