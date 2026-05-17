namespace HospitalManagement.Application.DTOs
{
    public class CreatePaymentDto
    {
        public Guid AppointmentId { get; set; }
        public decimal Amount { get; set; }
        public string CardNumber { get; set; } = string.Empty;
        public string CardHolderName { get; set; } = string.Empty;
        public string ExpiryMonth { get; set; } = string.Empty;
        public string ExpiryYear { get; set; } = string.Empty;
        public string Cvv { get; set; } = string.Empty;
    }

    public class PaymentResponseDto
    {
        public Guid Id { get; set; }
        public Guid AppointmentId { get; set; }
        public decimal Amount { get; set; }
        public string CardLast4 { get; set; } = string.Empty;
        public string CardHolderName { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? FailureReason { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }
}
