# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e5]:
    - generic [ref=e6]:
      - generic [ref=e7]: Welcome Back
      - generic [ref=e8]: Sign in to your account to continue
    - generic [ref=e10]:
      - button "Continue with Google" [ref=e11] [cursor=pointer]:
        - img
        - text: Continue with Google
      - generic [ref=e15]: Or continue with email
      - generic [ref=e17]:
        - generic [ref=e18]:
          - generic [ref=e19]: Email
          - textbox "Email" [ref=e20]
        - generic [ref=e21]:
          - generic [ref=e22]: Password
          - textbox "Password" [ref=e23]
        - button "Sign In" [ref=e24] [cursor=pointer]
      - generic [ref=e25]:
        - text: Don't have an account?
        - button "Sign up" [ref=e26]
  - region "Notifications alt+T"
```