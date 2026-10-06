FROM docker.io/library/amazoncorretto:21-al2023-headless

ARG NEOFORGE_VERSION=21.1.252
WORKDIR /server

RUN dnf install -y wget \
    && wget -q "https://maven.neoforged.net/releases/net/neoforged/neoforge/${NEOFORGE_VERSION}/neoforge-${NEOFORGE_VERSION}-installer.jar" \
    && java -jar "neoforge-${NEOFORGE_VERSION}-installer.jar" --installServer \
    && rm "neoforge-${NEOFORGE_VERSION}-installer.jar" \
    && chmod +x run.sh \
    && dnf clean all

COPY entrypoint.sh /usr/local/bin/server-entrypoint
RUN sed -i 's/\r$//' /usr/local/bin/server-entrypoint \
    && chmod +x /usr/local/bin/server-entrypoint

EXPOSE 25565
VOLUME ["/server/world"]

ENTRYPOINT ["/usr/local/bin/server-entrypoint"]
