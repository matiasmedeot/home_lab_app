// src/infrastructure/observability/metricsMiddleware.js
import { metrics, trace } from '@opentelemetry/api';

export function setupMetricsMiddleware() {
  // Crear contadores para las API
  const httpRequestCounter = metrics.getMeter('homelab-api').createCounter('http_requests_total', {
    description: 'Total number of HTTP requests',
  });

  const httpRequestDurationHistogram = metrics.getMeter('homelab-api').createHistogram('http_request_duration_seconds', {
    description: 'HTTP request duration in seconds',
  });

  const httpRequestSizeHistogram = metrics.getMeter('homelab-api').createHistogram('http_request_size_bytes', {
    description: 'HTTP request size in bytes',
  });

  const httpResponseSizeHistogram = metrics.getMeter('homelab-api').createHistogram('http_response_size_bytes', {
    description: 'HTTP response size in bytes',
  });

  return (req, res, next) => {
    const start = Date.now();
    const requestSize = Buffer.byteLength(JSON.stringify(req.body || ''));

    // Agregar finalización de la solicitud
    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000; // Convertir a segundos
      const path = req.route ? req.route.path : req.path;
      const method = req.method;
      const statusCode = res.statusCode;
      const labels = { path, method, status_code: statusCode };

      // Registrar la duración y el contador
      httpRequestCounter.add(1, labels);
      httpRequestDurationHistogram.record(duration, labels);
      httpRequestSizeHistogram.record(requestSize, labels);

      // Obtener tamaño de respuesta si está disponible
      const responseSize = parseInt(res.getHeader('content-length') || '0');
      if (responseSize > 0) {
        httpResponseSizeHistogram.record(responseSize, labels);
      }

      // Obtener el span actual
      const currentSpan = trace.getActiveSpan();
      if (currentSpan) {
        currentSpan.setAttribute('http.response_content_length', responseSize);
        currentSpan.setAttribute('http.request_content_length', requestSize);
      }
    });

    next();
  };
}