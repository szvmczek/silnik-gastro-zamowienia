package com.pizzashowcase.order.domain;

import com.pizzashowcase.shared.domain.AuditableEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "orders")
public class Order extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", nullable = false, unique = true, length = 11)
    private String orderNumber;

    @Column(name = "public_tracking_token", nullable = false, unique = true, columnDefinition = "uuid")
    private UUID publicTrackingToken;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status = OrderStatus.NEW;

    @Column(name = "customer_name", nullable = false, length = 120)
    private String customerName;

    @Column(name = "customer_phone", nullable = false, length = 20)
    private String customerPhone;

    @Column(name = "customer_email", length = 160)
    private String customerEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "fulfillment_type", nullable = false, length = 20)
    private FulfillmentType fulfillmentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 30)
    private PaymentMethod paymentMethod;

    @Embedded
    private Address deliveryAddress = Address.empty();

    @Column(name = "customer_notes", length = 500)
    private String customerNotes;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Column(name = "delivery_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal deliveryFee = BigDecimal.ZERO;

    @Column(name = "delivery_zone_name", length = 80)
    private String deliveryZoneName;

    // D-03: nominał, z którego klient chce resztę. null = odliczona kwota.
    @Column(name = "cash_change_from", precision = 10, scale = 2)
    private BigDecimal cashChangeFrom;

    @Column(name = "eta_minutes")
    private Integer etaMinutes;

    @Column(name = "eta_set_at")
    private Instant etaSetAt;

    @Version
    @Column(nullable = false)
    private Long version;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private Set<OrderItem> items = new LinkedHashSet<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("changedAt ASC, id ASC")
    private Set<OrderStatusHistory> statusHistory = new LinkedHashSet<>();

    protected Order() {
    }

    public Order(String orderNumber,
                 UUID publicTrackingToken,
                 String customerName,
                 String customerPhone,
                 String customerEmail,
                 FulfillmentType fulfillmentType,
                 PaymentMethod paymentMethod,
                 Address deliveryAddress,
                 String customerNotes,
                 BigDecimal cashChangeFrom,
                 BigDecimal subtotal,
                 BigDecimal deliveryFee,
                 String deliveryZoneName,
                 BigDecimal total) {
        this.orderNumber = orderNumber;
        this.publicTrackingToken = publicTrackingToken;
        this.status = OrderStatus.NEW;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.customerEmail = customerEmail;
        this.fulfillmentType = fulfillmentType;
        this.paymentMethod = paymentMethod;
        this.deliveryAddress = deliveryAddress != null ? deliveryAddress : Address.empty();
        this.customerNotes = customerNotes;
        this.cashChangeFrom = cashChangeFrom;
        this.subtotal = subtotal;
        this.deliveryFee = deliveryFee != null ? deliveryFee : BigDecimal.ZERO;
        this.deliveryZoneName = deliveryZoneName;
        this.total = total;
    }

    public Long getId() {
        return id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public UUID getPublicTrackingToken() {
        return publicTrackingToken;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public FulfillmentType getFulfillmentType() {
        return fulfillmentType;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public Address getDeliveryAddress() {
        return deliveryAddress;
    }

    public String getCustomerNotes() {
        return customerNotes;
    }

    public BigDecimal getCashChangeFrom() {
        return cashChangeFrom;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public BigDecimal getDeliveryFee() {
        return deliveryFee;
    }

    public String getDeliveryZoneName() {
        return deliveryZoneName;
    }

    public Integer getEtaMinutes() {
        return etaMinutes;
    }

    public Instant getEtaSetAt() {
        return etaSetAt;
    }

    // Atomic update of (etaMinutes, etaSetAt) — preserves the invariant
    // etaMinutes != null ⟺ etaSetAt != null. Do not expose individual setters.
    public void setEta(Integer minutes) {
        this.etaMinutes = minutes;
        this.etaSetAt = minutes != null ? Instant.now() : null;
    }

    public Long getVersion() {
        return version;
    }

    public Set<OrderItem> getItems() {
        return items;
    }

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    // Poniższe mutatory istnieją wyłącznie dla edycji zamówienia z panelu
    // (OrderEditService). Checkout ustawia te wartości przez konstruktor
    // i ich nie rusza — zamówienie klienta dalej jest niemutowalne
    // poza statusem, ETA i jawną edycją admina.

    // orphanRemoval na kolekcji kasuje wiersz przy usunięciu z setu.
    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public void setCustomerNotes(String customerNotes) {
        this.customerNotes = customerNotes;
    }

    public void setCashChangeFrom(BigDecimal cashChangeFrom) {
        this.cashChangeFrom = cashChangeFrom;
    }

    public Set<OrderStatusHistory> getStatusHistory() {
        return statusHistory;
    }

    public void addStatusHistory(OrderStatusHistory entry) {
        statusHistory.add(entry);
        entry.setOrder(this);
    }
}
