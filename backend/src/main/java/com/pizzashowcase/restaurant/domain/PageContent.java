package com.pizzashowcase.restaurant.domain;

import com.pizzashowcase.shared.domain.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;

@Entity
@Table(name = "page_content", uniqueConstraints = @UniqueConstraint(columnNames = "section_key"))
public class PageContent extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "section_key", nullable = false, length = 20)
    private SectionKey sectionKey;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "cta_label", length = 60)
    private String ctaLabel;

    @Column(name = "cta_href", length = 300)
    private String ctaHref;

    @Version
    @Column(nullable = false)
    private Long version;

    protected PageContent() {
    }

    public Long getVersion() {
        return version;
    }

    public Long getId() {
        return id;
    }

    public SectionKey getSectionKey() {
        return sectionKey;
    }

    public void setSectionKey(SectionKey sectionKey) {
        this.sectionKey = sectionKey;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getCtaLabel() {
        return ctaLabel;
    }

    public void setCtaLabel(String ctaLabel) {
        this.ctaLabel = ctaLabel;
    }

    public String getCtaHref() {
        return ctaHref;
    }

    public void setCtaHref(String ctaHref) {
        this.ctaHref = ctaHref;
    }
}
