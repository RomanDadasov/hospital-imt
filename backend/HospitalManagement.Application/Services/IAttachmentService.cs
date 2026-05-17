using HospitalManagement.DTOs;

namespace HospitalManagement.Services
{
    public interface IAttachmentService
    {
        Task<AttachmentResponseDto?> UploadAsync(
            Guid appointmentId,
            Stream stream,
            string originalFileName,
            string contentType,
            long length,
            string userId,
            CancellationToken cancellationToken = default);

        Task<(Stream stream, string fileName, string contentType)?> GetDownloadAsync(
            int attachmentId,
            CancellationToken cancellationToken = default);

        Task<bool> DeleteAsync(
            int attachmentId,
            CancellationToken cancellationToken = default);
    }
}
