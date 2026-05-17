namespace HospitalManagement.Services
{
    public interface IEmailService
    {
        Task SendAppointmentCreatedAsync(string toEmail, string patientName, string doctorName, DateTimeOffset appointmentDate, string portalLink);
        Task SendAppointmentConfirmedAsync(string toEmail, string patientName, string doctorName, DateTimeOffset appointmentDate);
        Task SendAppointmentCancelledAsync(string toEmail, string patientName, string doctorName, DateTimeOffset appointmentDate);
        Task SendAppointmentCompletedAsync(string toEmail, string patientName, string doctorName, DateTimeOffset appointmentDate);
        Task SendWelcomeDoctorAsync(string toEmail, string doctorName, string temporaryPassword);
        Task SendPaymentReceiptAsync(string toEmail, string patientName, string doctorName, DateTimeOffset appointmentDate, decimal amount, string transactionId, string cardLast4, byte[] receiptPdf);
        Task SendPaymentReminderAsync(string toEmail, string patientName, string doctorName, DateTimeOffset appointmentDate, decimal amount, string portalLink);
        Task SendPaymentConfirmedAsync(string toEmail, string patientName, decimal amount, Guid appointmentId);
        Task SendPasswordResetAsync(string toEmail, string fullName, string token);
        Task SendTwoFactorCodeAsync(string toEmail, string fullName, string code);
        Task SendPrescriptionAsync(string toEmail, string patientName, string doctorName, string diagnosis, byte[] pdfAttachment);
    }
}
