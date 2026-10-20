/**
 */
package CEML;

import org.eclipse.emf.common.util.EList;

import org.eclipse.emf.ecore.EObject;

/**
 * <!-- begin-user-doc -->
 * A representation of the model object '<em><b>Circular Economy</b></em>'.
 * <!-- end-user-doc -->
 *
 * <p>
 * The following features are supported:
 * </p>
 * <ul>
 *   <li>{@link CEML.CircularEconomy#getName <em>Name</em>}</li>
 *   <li>{@link CEML.CircularEconomy#getConsumer <em>Consumer</em>}</li>
 * </ul>
 *
 * @see CEML.CEMLPackage#getCircularEconomy()
 * @model
 * @generated
 */
public interface CircularEconomy extends EObject {
	/**
	 * Returns the value of the '<em><b>Name</b></em>' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the value of the '<em>Name</em>' attribute.
	 * @see #setName(String)
	 * @see CEML.CEMLPackage#getCircularEconomy_Name()
	 * @model
	 * @generated
	 */
	String getName();

	/**
	 * Sets the value of the '{@link CEML.CircularEconomy#getName <em>Name</em>}' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @param value the new value of the '<em>Name</em>' attribute.
	 * @see #getName()
	 * @generated
	 */
	void setName(String value);

	/**
	 * Returns the value of the '<em><b>Consumer</b></em>' containment reference list.
	 * The list contents are of type {@link CEML.Consumer}.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the value of the '<em>Consumer</em>' containment reference list.
	 * @see CEML.CEMLPackage#getCircularEconomy_Consumer()
	 * @model containment="true"
	 * @generated
	 */
	EList<Consumer> getConsumer();

} // CircularEconomy
