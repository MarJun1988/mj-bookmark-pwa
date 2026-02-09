FROM postgres:16-alpine

COPY backup.sh /backup.sh

RUN chmod +x /backup.sh

# Führt jede Stunde ein Backup aus
CMD ["sh", "-c", "while true; do /backup.sh; sleep 86400; done"]