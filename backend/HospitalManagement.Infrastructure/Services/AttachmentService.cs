using HospitalManagement.Data;
using HospitalManagement.DTOs;
using HospitalManagement.Models;
using HospitalManagement.Storage;
using Microsoft.EntityFrameworkCore;


namespace HospitalManagement.Services
{
    public class AttachmentService : IAttachmentService
    {
        public const long MaxFileSizeBytes = 10 * 1024 * 1024;

        public static readonly string[] AllowedExtensions =
        {
            ".jpg", ".jpeg", ".png", ".pdf",
            ".txt", ".zip", ".xlsx", ".xls",
            ".docx", ".doc"
        };

        public static readonly string[] AllowedContentTypes =
        {
            "image/jpeg", "image/png", "application/pdf",
            "text/plain", "application/zip",
            "application/x-zip-compressed",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel", "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        };

        private readonly AppDbContext _context;
        private readonly IFileStorage _storage;

        public AttachmentService(AppDbContext context, IFileStorage storage)
        {
            _context = context;
            _storage = storage;
        }

        public async Task<AttachmentResponseDto?> UploadAsync(
            Guid appointmentId,
            Stream stream,
            string originalFileName,
            string contentType,
            long length,
            string userId,
            CancellationToken cancellationToken = default)
        {
            if (length > MaxFileSizeBytes)
                throw new ArgumentException($"File size must not exceed {MaxFileSizeBytes / (1024 * 1024)} MB");

            var ext = Path.GetExtension(originalFileName)?.ToLowerInvariant();
            if (string.IsNullOrEmpty(ext) || !AllowedExtensions.Contains(ext))
                throw new ArgumentException($"Allowed extensions: {string.Join(", ", AllowedExtensions)}");

            if (!AllowedContentTypes.Contains(contentType, StringComparer.OrdinalIgnoreCase))
                throw new ArgumentException($"Allowed content types: {string.Join(", ", AllowedContentTypes)}");

            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == appointmentId && a.DeletedAt == null, cancellationToken);

            if (appointment is null)
                throw new InvalidOperationException("Appointment not found.");

            var folderKey = $"appointments/{appointmentId}";
            var info = await _storage.UploadAsync(stream, originalFileName, contentType, folderKey, cancellationToken);

            var attachment = new AppointmentAttachment
            {
                AppointmentId = appointmentId,
                OriginalFileName = originalFileName,
                StoredFileName = info.StoredFileName,
                StorageKey = info.StorageKey,
                ContentType = contentType,
                FileSize = info.FileSize,
                UploadedByUserId = userId,
                UploadedAt = DateTimeOffset.UtcNow
            };

            _context.AppointmentAttachments.Add(attachment);
            await _context.SaveChangesAsync(cancellationToken);

            return new AttachmentResponseDto
            {
                Id = attachment.Id,
                AppointmentId = attachment.AppointmentId,
                OriginalFileName = attachment.OriginalFileName,
                ContentType = attachment.ContentType,
                FileSize = attachment.FileSize,
                UploadedByUserId = attachment.UploadedByUserId,
                UploadedAt = attachment.UploadedAt
            };
        }

        public async Task<(Stream stream, string fileName, string contentType)?> GetDownloadAsync(
            int attachmentId,
            CancellationToken cancellationToken = default)
        {
            var att = await _context.AppointmentAttachments
                .FirstOrDefaultAsync(a => a.Id == attachmentId, cancellationToken);

            if (att is null) return null;

            try
            {
                Stream stream;

                if (!string.IsNullOrEmpty(att.StorageKey) && att.StorageKey.StartsWith("http"))
                {
                    
                   
                    using var httpClient = new HttpClient();
                    var response = await httpClient.GetAsync(att.StorageKey, cancellationToken);
                    response.EnsureSuccessStatusCode();
                    var ms = new MemoryStream();
                    await response.Content.CopyToAsync(ms, cancellationToken);
                    ms.Position = 0;
                    stream = ms;
                }
                else if (!string.IsNullOrEmpty(att.StorageKey))
                {
                  
                    stream = await _storage.OpenReadAsync(att.StorageKey, cancellationToken);
                }
                else
                {
                  
                    var filePath = Path.Combine("appointments", att.AppointmentId.ToString(), att.StoredFileName);
                    if (!File.Exists(filePath))
                        throw new FileNotFoundException($"File not found: {filePath}");
                    stream = File.OpenRead(filePath);
                }

                return (stream, att.OriginalFileName, att.ContentType);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"AttachmentId={attachmentId}, Error={ex.Message}");
                throw;
            }
        }

        public async Task<bool> DeleteAsync(
            int attachmentId,
            CancellationToken cancellationToken = default)
        {
            var att = await _context.AppointmentAttachments
                .FirstOrDefaultAsync(a => a.Id == attachmentId, cancellationToken);

            if (att is null) return false;

            var key = string.IsNullOrEmpty(att.StorageKey)
                ? $"appointments/{att.AppointmentId}/{att.StoredFileName}"
                : att.StorageKey;

            _context.AppointmentAttachments.Remove(att);
            await _context.SaveChangesAsync(cancellationToken);
            await _storage.DeleteAsync(key, cancellationToken);

            return true;
        }
    }
}
