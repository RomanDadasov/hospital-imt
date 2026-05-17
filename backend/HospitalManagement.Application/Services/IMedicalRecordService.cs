using HospitalManagement.Application.DTOs;

namespace HospitalManagement.Application.Services
{
    public interface IMedicalRecordService
    {
        Task<IEnumerable<MedicalRecordResponseDto>> GetByPatientIdAsync(Guid patientId);
        Task<MedicalRecordResponseDto?> GetByIdAsync(Guid id);
        Task<MedicalRecordResponseDto> CreateAsync(CreateMedicalRecordDto dto, string userId, string userFullName);
        Task<MedicalRecordResponseDto?> UpdateAsync(Guid id, UpdateMedicalRecordDto dto, string userId, string userFullName);
        Task<bool> DeleteAsync(Guid id, string userId, string userFullName);
        Task<byte[]> GeneratePatientHistoryPdfAsync(Guid patientId);
    }
}
