import { Link } from 'react-router-dom';

const Dashboard = () => {
  const cards = [
    { title: 'Módulos', description: 'Gestionar módulos del sistema', href: '/modulos', color: 'blue' },
    { title: 'Formularios', description: 'Gestionar formularios', href: '/formularios', color: 'green' },
    { title: 'Acciones', description: 'Gestionar acciones', href: '/acciones', color: 'purple' },
    { title: 'Grupos', description: 'Gestionar grupos de usuarios', href: '/grupos', color: 'yellow' },
    { title: 'Usuarios', description: 'Gestionar usuarios', href: '/usuarios', color: 'red' },
  ];

  const colorClasses = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    yellow: 'bg-yellow-500 hover:bg-yellow-600',
    red: 'bg-red-500 hover:bg-red-600',
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Panel de control para gestionar el módulo de seguridad
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.href}
            className={`${colorClasses[card.color as keyof typeof colorClasses]} rounded-lg shadow-md p-6 text-white transition-colors`}
          >
            <h2 className="text-xl font-semibold mb-2">{card.title}</h2>
            <p className="text-white/90">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

