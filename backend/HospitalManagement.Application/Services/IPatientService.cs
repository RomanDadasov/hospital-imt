using HospitalManagement.Common;
using HospitalManagement.DTOs;

namespace HospitalManagement.Services
{
    public interface IPatientService
    {
        Task<PagedResult<PatientResponseDto>> GetAllAsync(QueryParameters parameters);
        Task<PatientResponseDto?> GetByIdAsync(Guid id);
        Task<PatientResponseDto> CreateAsync(CreatePatientDto dto, string userId, string userFullName);
        Task<PatientResponseDto?> UpdateAsync(Guid id, UpdatePatientDto dto, string userId, string userFullName);
        Task<bool> DeleteAsync(Guid id, string userId, string userFullName);
        Task<bool> ArchiveAsync(Guid id);
    }
}
