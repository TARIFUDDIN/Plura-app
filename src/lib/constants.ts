
export const pricingCards = [
    {
      title: 'Starter',
      description: 'Perfect for trying out plura',
      price: 'Free',
      duration: '',
      highlight: 'Key features',
      features: ['3 Sub accounts', '2 Team members', 'Unlimited pipelines'],
      priceId: '',
    },
    {
      title: 'Unlimited Saas',
      description: 'The ultimate agency kit',
      price: '$199',
      duration: 'month',
      highlight: 'Key features',
      features: ['Rebilling', '24/7 Support team'],
      priceId: 'price_1RHr7JR8CMCKQcT9DSJh8PTr',
    },
    {
      title: 'Basic',
      description: 'For serious agency owners',
      price: '$49',
      duration: 'month',
      highlight: 'Everything in Starter, plus',
      features: ['Unlimited Sub accounts', 'Unlimited Team members'],
      priceId: 'price_1RHr7JR8CMCKQcT941eHzkBh',
    },
  ]
  export const addOnProducts = [{
    title: 'Priority Support',
    // Product 3: Priority Support
    id: 'prod_SCFrl6LlLiZrkQ'
}]

export type EditorBtns =
  | 'text'
  | 'container'
  | 'section'
  | 'contactForm'
  | 'paymentForm'
  | 'link'
  | '2Col'
  | 'video'
  | '__body'
  | 'image'
  | null
  | '3Col'
  export const defaultStyles: React.CSSProperties = {
    backgroundPosition: "center",
    objectFit: "cover",
    backgroundRepeat: "no-repeat",
    textAlign: "left",
    opacity: "100%",
  };