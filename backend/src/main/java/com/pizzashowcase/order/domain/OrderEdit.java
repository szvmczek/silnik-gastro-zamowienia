package com.pizzashowcase.order.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Jeden wpis historii edycji treści zamówienia.
 *
 * <p>Encja celowo NIE wisi na {@code @OneToMany} w {@link Order} — grafy
 * encji w {@code OrderRepository} (a przez nie kształt payloadu listy
 * z AD-022) mają zostać nietknięte. Dostęp idzie przez
 * {@code OrderEditRepository} po {@code orderId}.
 *
 * <p>{@code summary} to gotowy tekst po polsku, jedna zmiana w jednej
 * linii — historia ma być czytelna dla człowieka, nie surowym JSON-em.
 * {@code snapshotBefore} (JSONB) trzyma stan sprzed edycji i służy
 * wyłącznie cofaniu; nigdy nie trafia do DTO.
 */
@Entity
@Table(name = "order_edit")
public class OrderEdit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "edited_at", nullable = false)
    private Instant editedAt;

    @Column(name = "edited_by", length = 160)
    private String editedBy;

    @Column(name = "summary", nullable = false, columnDefinition = "text")
    private String summary;

    @Column(name = "total_before", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalBefore;

    @Column(name = "total_after", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAfter;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "snapshot_before", nullable = false)
    private String snapshotBefore;

    @Column(name = "undone_at")
    private Instant undoneAt;

    @Column(name = "undone_by", length = 160)
    private String undoneBy;

    protected OrderEdit() {
    }

    public OrderEdit(Long orderId,
                     Instant editedAt,
                     String editedBy,
                     String summary,
                     BigDecimal totalBefore,
                     BigDecimal totalAfter,
                     String snapshotBefore) {
        this.orderId = orderId;
        this.editedAt = editedAt;
        this.editedBy = editedBy;
        this.summary = summary;
        this.totalBefore = totalBefore;
        this.totalAfter = totalAfter;
        this.snapshotBefore = snapshotBefore;
    }

    public Long getId() {
        return id;
    }

    public Long getOrderId() {
        return orderId;
    }

    public Instant getEditedAt() {
        return editedAt;
    }

    public String getEditedBy() {
        return editedBy;
    }

    public String getSummary() {
        return summary;
    }

    public BigDecimal getTotalBefore() {
        return totalBefore;
    }

    public BigDecimal getTotalAfter() {
        return totalAfter;
    }

    public String getSnapshotBefore() {
        return snapshotBefore;
    }

    public Instant getUndoneAt() {
        return undoneAt;
    }

    public String getUndoneBy() {
        return undoneBy;
    }

    public boolean isUndone() {
        return undoneAt != null;
    }

    /** Cofnięcie nie kasuje wpisu — stempluje go, żeby ślad został. */
    public void markUndone(Instant at, String by) {
        this.undoneAt = at;
        this.undoneBy = by;
    }
}
