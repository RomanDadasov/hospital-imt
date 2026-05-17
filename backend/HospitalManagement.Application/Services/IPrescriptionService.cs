using HospitalManagement.Application.DTOs;

namespace HospitalManagement.Application.Services
{
    public interface IPrescriptionService
    {
        Task<PrescriptionResponseDto> CreateAsync(CreatePrescriptionDto dto, string doctorUserId);
        Task<PrescriptionResponseDto?> GetByIdAsync(Guid id);
        Task<PrescriptionResponseDto?> GetByQrCodeAsync(string qrCode);
        Task<IEnumerable<PrescriptionResponseDto>> GetByAppointmentIdAsync(Guid appointmentId);
        Task<IEnumerable<PrescriptionResponseDto>> GetByPatientIdAsync(Guid patientId);
        Task<bool> DispenseAsync(string qrCode);
        Task<byte[]> GeneratePdfAsync(Guid id);
    }
}
