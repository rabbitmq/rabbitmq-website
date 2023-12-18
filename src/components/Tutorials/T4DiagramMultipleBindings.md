```mermaid
flowchart LR
    P((P))
    X{{direct}}
    Q1[[Q₁]]
    Q2[[Q₂]]
    C1((C₁))
    C2((C₂))

    P --> X
    X -- black --> Q1 & Q2
    Q1 --> C1
    Q2 --> C2

    class P mermaid-producer
    class X mermaid-exchange
    class Q1 mermaid-queue
    class Q2 mermaid-queue
    class C1 mermaid-consumer
    class C2 mermaid-consumer
```
