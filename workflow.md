graph TD
    A[Member Registration] --> B[Supabase Auth]
    B --> C[Create User Profile]
    C --> D[Membership Application]
    D --> E{Admin Approval}
    E -->|Approved| F[Active Membership]
    E -->|Rejected| G[Notification]
    F --> H[Monthly Fee System]
    H --> I[Payment Processing]
    I --> J[Receipt Generation]
    I --> K[Membership Status Update]
    
    L[Event Creation] --> M[Event Registration]
    M --> N[Attendance Tracking]
    
    F --> O[Membership Card]
    O --> P[QR Code Generation]
    
    Q[Financial Transaction] --> R[Financial Reports]
    R --> S[Analytics Dashboard]
    
    T[Club Asset] --> U[Booking System]
    U --> V[Usage Tracking]