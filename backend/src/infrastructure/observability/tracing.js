// src/infrastructure/observability/tracing.js
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes, SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

export const initTracing = () => {

  // Exportador de trazas con gRPC
  const traceExporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector:4317',
  });

  // Exportador de métricas con gRPC - con configuración explícita de histogramas
  const metricExporter = new OTLPMetricExporter({
    url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT || 'http://otel-collector:4317',
  });

  // Configurar el histograma con valores específicos
  const metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 15000,
  });

  // Utilizamos una configuración explícita para instrumentaciones
  const instrumentations = [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': { 
        enabled: true,
        // Configuración explícita para histogramas
        ignoreIncomingRequestHook: () => false,
        ignoreOutgoingRequestHook: () => false,
      },
      '@opentelemetry/instrumentation-express': { 
        enabled: true 
      },
    }),
  ];

  // Iniciamos el SDK con configuración explícita
  const sdk = new NodeSDK({
    traceExporter,
    metricReader,
    instrumentations,
  });

  // Iniciamos el SDK
  sdk.start();
  console.log('OpenTelemetry initialization complete with gRPC exporters');

  // Aseguramos un cierre limpio
  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('OpenTelemetry terminated successfully'))
      .catch((error) => console.error('Error terminating OpenTelemetry', error))
      .finally(() => process.exit(0));
  });

  return sdk;
};

// Auto-inicializar al importar
const sdk = initTracing();
export default sdk;