# Diagram 📊

## Entity Relationship Diagram (ERD)
```mermaid
erDiagram
    Users ||--o{ Gigs : "creates"
    Users ||--o{ Orders : "places (buyer)"
    Gigs ||--o{ Orders : "is ordered"
    Orders ||--|| Reviews : "has"
    Users ||--o{ Reviews : "writes (reviewer)"
    Users ||--o{ Reviews : "receives (seller)"
    Orders ||--o{ Messages : "contains"
    Users ||--o{ Messages : "sends"
    Users ||--o{ Transactions : "performs"

    Users {
        uuid user_id PK
        string username
        string email
        decimal balance
        decimal average_rating
        text bio
        string avatar_url
        timestamp created_at
    }

    Gigs {
        uuid gig_id PK
        uuid seller_id FK
        string title
        text description
        decimal price
        string category_id
        boolean is_active
        timestamp created_at
    }

    Orders {
        uuid order_id PK
        uuid buyer_id FK
        uuid gig_id FK
        enum status
        decimal total_price
        text instructions
        timestamp created_at
    }

    Reviews {
        uuid review_id PK
        uuid order_id FK
        uuid reviewer_id FK
        uuid seller_id FK
        int rating
        text comment
        timestamp created_at
    }

    Messages {
        uuid message_id PK
        uuid order_id FK
        uuid sender_id FK
        text content
        timestamp created_at
    }

    Transactions {
        uuid transaction_id PK
        uuid user_id FK
        enum type
        decimal amount
        string description
        uuid related_order_id FK
        timestamp created_at
    }
```

## User Journey Flowchart
```mermaid
graph TD
    Start([User Landing]) --> Search[Search Gigs]
    Search --> Select[Select Gig]
    Select --> Checkout[Checkout/Payment]
    Checkout --> CreateOrder[Order Created]
    CreateOrder --> SetInstructions[Buyer Provides Instructions]
    SetInstructions --> InProgress[Seller: In Progress]
    InProgress --> Chat[Buyer & Seller Chat]
    Chat --> Delivery[Seller: Deliver Project]
    Delivery --> Review[Buyer: Review & Complete]
    Review --> End([Order Finished])

    subgraph Wallet
        Deposit[Deposit Jigsawcoin] --> Balance[Check Balance]
        Balance --> Withdraw[Withdraw]
    end

    subgraph SellerManagement
        CreateGig[Create New Gig] --> ManageGig[Manage/Edit Gigs]
        ManageGig --> Dashboard[Seller Dashboard]
    end
```

## UML Class Diagram
```mermaid
classDiagram
    class User {
        +UUID user_id
        +String username
        +String email
        +Decimal balance
        +Decimal average_rating
        +Text bio
        +String avatar_url
    }

    class Gig {
        +UUID gig_id
        +UUID seller_id
        +String title
        +Text description
        +Decimal price
        +String category
        +Boolean is_active
    }

    class Order {
        +UUID order_id
        +UUID buyer_id
        +UUID gig_id
        +OrderStatus status
        +Decimal total_price
        +String instructions
    }

    class Review {
        +UUID review_id
        +UUID order_id
        +UUID reviewer_id
        +UUID seller_id
        +Int rating
        +Text comment
    }

    class Message {
        +UUID message_id
        +UUID order_id
        +UUID sender_id
        +Text content
    }

    class Transaction {
        +UUID transaction_id
        +UUID user_id
        +TransactionType type
        +Decimal amount
    }

    User "1" -- "0..*" Gig : sells
    User "1" -- "0..*" Order : buys
    Gig "1" -- "0..*" Order : part of
    Order "1" -- "0..1" Review : results in
    Order "1" -- "0..*" Message : contains
    User "1" -- "0..*" Transaction : participates in
```



This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
