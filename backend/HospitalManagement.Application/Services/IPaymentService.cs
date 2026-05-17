using HospitalManagement.Application.DTOs;

namespace HospitalManagement.Application.Services
{
    public interface IPaymentService
    {
        Task<PaymentResponseDto> ProcessAsync(CreatePaymentDto dto);

        Task<PaymentResponseDto?> GetByAppointmentIdAsync(Guid appointmentId);

        Task<IEnumerable<PaymentResponseDto>> GetAllAsync();

        Task SendReminderAsync(Guid appointmentId);

        Task<byte[]> GenerateReceiptPdfAsync(Guid appointmentId);
    }
}