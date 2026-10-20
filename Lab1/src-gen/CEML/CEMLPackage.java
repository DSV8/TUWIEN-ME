/**
 */
package CEML;

import org.eclipse.emf.ecore.EAttribute;
import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.EReference;

/**
 * <!-- begin-user-doc -->
 * The <b>Package</b> for the model.
 * It contains accessors for the meta objects to represent
 * <ul>
 *   <li>each class,</li>
 *   <li>each feature of each class,</li>
 *   <li>each operation of each class,</li>
 *   <li>each enum,</li>
 *   <li>and each data type</li>
 * </ul>
 * <!-- end-user-doc -->
 * @see CEML.CEMLFactory
 * @model kind="package"
 * @generated
 */
public interface CEMLPackage extends EPackage {
	/**
	 * The package name.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	String eNAME = "CEML";

	/**
	 * The package namespace URI.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	String eNS_URI = "http://www.example.org/CEML";

	/**
	 * The package namespace name.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	String eNS_PREFIX = "CEML";

	/**
	 * The singleton instance of the package.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	CEMLPackage eINSTANCE = CEML.impl.CEMLPackageImpl.init();

	/**
	 * The meta object id for the '{@link CEML.impl.ConsumerImpl <em>Consumer</em>}' class.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see CEML.impl.ConsumerImpl
	 * @see CEML.impl.CEMLPackageImpl#getConsumer()
	 * @generated
	 */
	int CONSUMER = 0;

	/**
	 * The feature id for the '<em><b>Name</b></em>' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int CONSUMER__NAME = 0;

	/**
	 * The number of structural features of the '<em>Consumer</em>' class.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int CONSUMER_FEATURE_COUNT = 1;

	/**
	 * The number of operations of the '<em>Consumer</em>' class.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int CONSUMER_OPERATION_COUNT = 0;

	/**
	 * The meta object id for the '{@link CEML.impl.CircularEconomyImpl <em>Circular Economy</em>}' class.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see CEML.impl.CircularEconomyImpl
	 * @see CEML.impl.CEMLPackageImpl#getCircularEconomy()
	 * @generated
	 */
	int CIRCULAR_ECONOMY = 1;

	/**
	 * The feature id for the '<em><b>Name</b></em>' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int CIRCULAR_ECONOMY__NAME = 0;

	/**
	 * The feature id for the '<em><b>Consumer</b></em>' containment reference list.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int CIRCULAR_ECONOMY__CONSUMER = 1;

	/**
	 * The number of structural features of the '<em>Circular Economy</em>' class.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int CIRCULAR_ECONOMY_FEATURE_COUNT = 2;

	/**
	 * The number of operations of the '<em>Circular Economy</em>' class.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 * @ordered
	 */
	int CIRCULAR_ECONOMY_OPERATION_COUNT = 0;

	/**
	 * Returns the meta object for class '{@link CEML.Consumer <em>Consumer</em>}'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the meta object for class '<em>Consumer</em>'.
	 * @see CEML.Consumer
	 * @generated
	 */
	EClass getConsumer();

	/**
	 * Returns the meta object for the attribute '{@link CEML.Consumer#getName <em>Name</em>}'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the meta object for the attribute '<em>Name</em>'.
	 * @see CEML.Consumer#getName()
	 * @see #getConsumer()
	 * @generated
	 */
	EAttribute getConsumer_Name();

	/**
	 * Returns the meta object for class '{@link CEML.CircularEconomy <em>Circular Economy</em>}'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the meta object for class '<em>Circular Economy</em>'.
	 * @see CEML.CircularEconomy
	 * @generated
	 */
	EClass getCircularEconomy();

	/**
	 * Returns the meta object for the attribute '{@link CEML.CircularEconomy#getName <em>Name</em>}'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the meta object for the attribute '<em>Name</em>'.
	 * @see CEML.CircularEconomy#getName()
	 * @see #getCircularEconomy()
	 * @generated
	 */
	EAttribute getCircularEconomy_Name();

	/**
	 * Returns the meta object for the containment reference list '{@link CEML.CircularEconomy#getConsumer <em>Consumer</em>}'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the meta object for the containment reference list '<em>Consumer</em>'.
	 * @see CEML.CircularEconomy#getConsumer()
	 * @see #getCircularEconomy()
	 * @generated
	 */
	EReference getCircularEconomy_Consumer();

	/**
	 * Returns the factory that creates the instances of the model.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the factory that creates the instances of the model.
	 * @generated
	 */
	CEMLFactory getCEMLFactory();

	/**
	 * <!-- begin-user-doc -->
	 * Defines literals for the meta objects that represent
	 * <ul>
	 *   <li>each class,</li>
	 *   <li>each feature of each class,</li>
	 *   <li>each operation of each class,</li>
	 *   <li>each enum,</li>
	 *   <li>and each data type</li>
	 * </ul>
	 * <!-- end-user-doc -->
	 * @generated
	 */
	interface Literals {
		/**
		 * The meta object literal for the '{@link CEML.impl.ConsumerImpl <em>Consumer</em>}' class.
		 * <!-- begin-user-doc -->
		 * <!-- end-user-doc -->
		 * @see CEML.impl.ConsumerImpl
		 * @see CEML.impl.CEMLPackageImpl#getConsumer()
		 * @generated
		 */
		EClass CONSUMER = eINSTANCE.getConsumer();

		/**
		 * The meta object literal for the '<em><b>Name</b></em>' attribute feature.
		 * <!-- begin-user-doc -->
		 * <!-- end-user-doc -->
		 * @generated
		 */
		EAttribute CONSUMER__NAME = eINSTANCE.getConsumer_Name();

		/**
		 * The meta object literal for the '{@link CEML.impl.CircularEconomyImpl <em>Circular Economy</em>}' class.
		 * <!-- begin-user-doc -->
		 * <!-- end-user-doc -->
		 * @see CEML.impl.CircularEconomyImpl
		 * @see CEML.impl.CEMLPackageImpl#getCircularEconomy()
		 * @generated
		 */
		EClass CIRCULAR_ECONOMY = eINSTANCE.getCircularEconomy();

		/**
		 * The meta object literal for the '<em><b>Name</b></em>' attribute feature.
		 * <!-- begin-user-doc -->
		 * <!-- end-user-doc -->
		 * @generated
		 */
		EAttribute CIRCULAR_ECONOMY__NAME = eINSTANCE.getCircularEconomy_Name();

		/**
		 * The meta object literal for the '<em><b>Consumer</b></em>' containment reference list feature.
		 * <!-- begin-user-doc -->
		 * <!-- end-user-doc -->
		 * @generated
		 */
		EReference CIRCULAR_ECONOMY__CONSUMER = eINSTANCE.getCircularEconomy_Consumer();

	}

} //CEMLPackage
