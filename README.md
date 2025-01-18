# DisChord
Intérprete para crear bots de Discord de forma rápida y eficaz.

# Example

```ts
// DISCORD BOT USING DisChord
BOT "MiToken" {
    CONSOLA "BOT ONLINE"
    COMANDO "saludo" {
        RESPONDER "¡Hola, mundo!"
    }
}
```

----
# Pendiente
- Extender funcionalidades del método Consola.
- Crear la función útil llamada "ReadStatements" la cual evitará bucles en ficheros como Bot, main o Command del Parser.
- Exportar las variables "Current" y "Tokens" desde que se comienza a Parsear.