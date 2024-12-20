# Use Python 3.11 base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy the entire project first
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r backend/requirements.txt

# Remove the duplicate src directory in backend if it exists
RUN rm -rf /app/backend/src

# Set Python path to include the root directory only
ENV PYTHONPATH=/app

# Create directory for logs if needed
RUN mkdir -p /app/backend/logs

# Set working directory for running the app
WORKDIR /app/backend

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "run:app"] 