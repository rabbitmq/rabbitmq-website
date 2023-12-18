```mermaid
flowchart LR
    P((P))
    Q[[Queue]]
    C((C))

    P --> Q --> C

    class P mermaid-producer
    class Q mermaid-queue
    class C mermaid-consumer
```
