// lib/neo4j.ts
import neo4j from 'neo4j-driver'

export const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!)
)

export const getNeo4jSession = (mode: "READ" | "WRITE" = "READ") =>
  driver.session({ defaultAccessMode: mode === "READ" ? neo4j.session.READ : neo4j.session.WRITE });