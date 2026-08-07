import SignIn from './SignIn';

export default function CoordinatorSignIn({ onSignIn }) {
  return <SignIn mode="coordinator" onSignIn={onSignIn} />;
}
