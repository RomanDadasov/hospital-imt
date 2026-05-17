using HospitalManagement.Application.DTOs;
using HospitalManagement.Application.Services;
using HospitalManagement.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HospitalManagement.API.Controllers
{
    [Route("api/payments")]
    [ApiController]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _service;

        public PaymentsController(IPaymentService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Process([FromBody] CreatePaymentDto dto)
        {
            var result = await _service.ProcessAsync(dto);
            return Ok(ApiResponse<PaymentResponseDto>.SuccessResponse(result, "Payment processed"));
        }

        [HttpGet("appointment/{appointmentId}")]
        public async Task<IActionResult> GetByAppointment(Guid appointmentId)
        {
            var result = await _service.GetByAppointmentIdAsync(appointmentId);
            if (result is null) return NotFound(ApiResponse<PaymentResponseDto>.FailureResponse("Payment not found"));
            return Ok(ApiResponse<PaymentResponseDto>.SuccessResponse(result));
        }

        [HttpGet]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(ApiResponse<IEnumerable<PaymentResponseDto>>.SuccessResponse(result));
        }

        [HttpPost("{appointmentId}/reminder")]
        public async Task<IActionResult> SendReminder(Guid appointmentId)
        {
            await _service.SendReminderAsync(appointmentId);
            return Ok(ApiResponse<string>.SuccessResponse("Email sent"));
        }

        [HttpGet("appointment/{appointmentId}/receipt")]
        public async Task<IActionResult> GetReceipt(Guid appointmentId)
        {
            try
            {
                var pdf = await _service.GenerateReceiptPdfAsync(appointmentId);
                return File(pdf, "application/pdf", $"receipt-{appointmentId.ToString()[..8]}.pdf");
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ApiResponse<string>.FailureResponse(ex.Message));
            }
        }
    }
}