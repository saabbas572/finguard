import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

function Swagger() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fb' }}>
      <SwaggerUI url="/swagger.yaml" docExpansion="list" defaultModelsExpandDepth={-1} />
    </div>
  );
}

export default Swagger;
