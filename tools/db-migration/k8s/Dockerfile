FROM migrate/migrate:v4.18.2
COPY ./schema ./migrations
COPY ./data ./migrations


ENTRYPOINT ["migrate"]
CMD ["-help"]