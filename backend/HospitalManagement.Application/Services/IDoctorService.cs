using HospitalManagement.Common;
using HospitalManagement.DTOs;

namespace HospitalManagement.Services
{
    public interface IDoctorService
    {
        Task<PagedResult<DoctorResponseDto>> GetAllAsync(DoctorQueryParameters parameters);
        Task<DoctorResponseDto?> GetByIdAsync(Guid id);
        Task<DoctorResponseDto> CreateAsync(CreateDoctorDto dto, string userId, string userFullName);
        Task<DoctorResponseDto?> UpdateAsync(Guid id, UpdateDoctorDto dto, string userId, string userFullName);
        Task<bool> DeleteAsync(Guid id, string userId, string userFullName);
    }

}
